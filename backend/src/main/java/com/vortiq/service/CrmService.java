package com.vortiq.service;

import com.vortiq.model.crm.Customer;
import com.vortiq.model.crm.Deal;
import com.vortiq.model.crm.Lead;
import com.vortiq.repository.CustomerRepository;
import com.vortiq.repository.DealRepository;
import com.vortiq.repository.LeadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CrmService {

    @Autowired
    private LeadRepository leadRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DealRepository dealRepository;

    // Leads
    public List<Lead> getAllLeads() {
        return leadRepository.findAllByOrderByCreatedAtDesc();
    }

    public Lead createLead(Lead lead) {
        return leadRepository.save(lead);
    }

    public Lead updateLead(Long id, Lead details) {
        Lead lead = leadRepository.findById(id).orElseThrow(() -> new RuntimeException("Lead not found"));
        lead.setName(details.getName());
        lead.setCompany(details.getCompany());
        lead.setEmail(details.getEmail());
        lead.setPhone(details.getPhone());
        lead.setStage(details.getStage());
        lead.setEstimatedValue(details.getEstimatedValue());
        lead.setSource(details.getSource());
        lead.setAssignedTo(details.getAssignedTo());
        lead.setNotes(details.getNotes());
        return leadRepository.save(lead);
    }

    public void deleteLead(Long id) {
        leadRepository.deleteById(id);
    }

    // Customers
    public List<Customer> getAllCustomers() {
        return customerRepository.findAllByOrderByCreatedAtDesc();
    }

    public Customer createCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    // Deals
    public List<Deal> getAllDeals() {
        return dealRepository.findAllByOrderByCreatedAtDesc();
    }

    public Deal createDeal(Deal deal) {
        return dealRepository.save(deal);
    }

    public Deal updateDealStage(Long id, String stage) {
        Deal deal = dealRepository.findById(id).orElseThrow(() -> new RuntimeException("Deal not found"));
        deal.setStage(stage);
        if ("WON".equalsIgnoreCase(stage)) {
            deal.setProbability(100);
        } else if ("LOST".equalsIgnoreCase(stage)) {
            deal.setProbability(0);
        }
        return dealRepository.save(deal);
    }

    public Map<String, Object> getCrmStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLeads", leadRepository.count());
        stats.put("totalCustomers", customerRepository.count());
        stats.put("totalDeals", dealRepository.count());
        Double pipelineValue = dealRepository.findAll().stream()
                .filter(d -> !"LOST".equalsIgnoreCase(d.getStage()))
                .mapToDouble(d -> d.getAmount() != null ? d.getAmount() : 0.0)
                .sum();
        stats.put("pipelineValue", pipelineValue);
        return stats;
    }
}

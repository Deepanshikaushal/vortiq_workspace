package com.vortiq.controller;

import com.vortiq.model.crm.Customer;
import com.vortiq.model.crm.Deal;
import com.vortiq.model.crm.Lead;
import com.vortiq.service.CrmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/erp/crm")
@CrossOrigin(origins = "*")
public class CrmController {

    @Autowired
    private CrmService crmService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(crmService.getCrmStats());
    }

    // Leads
    @GetMapping("/leads")
    public ResponseEntity<List<Lead>> getAllLeads() {
        return ResponseEntity.ok(crmService.getAllLeads());
    }

    @PostMapping("/leads")
    public ResponseEntity<Lead> createLead(@RequestBody Lead lead) {
        return ResponseEntity.ok(crmService.createLead(lead));
    }

    @PutMapping("/leads/{id}")
    public ResponseEntity<Lead> updateLead(@PathVariable Long id, @RequestBody Lead lead) {
        return ResponseEntity.ok(crmService.updateLead(id, lead));
    }

    @DeleteMapping("/leads/{id}")
    public ResponseEntity<Void> deleteLead(@PathVariable Long id) {
        crmService.deleteLead(id);
        return ResponseEntity.noContent().build();
    }

    // Customers
    @GetMapping("/customers")
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseEntity.ok(crmService.getAllCustomers());
    }

    @PostMapping("/customers")
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer) {
        return ResponseEntity.ok(crmService.createCustomer(customer));
    }

    // Deals
    @GetMapping("/deals")
    public ResponseEntity<List<Deal>> getAllDeals() {
        return ResponseEntity.ok(crmService.getAllDeals());
    }

    @PostMapping("/deals")
    public ResponseEntity<Deal> createDeal(@RequestBody Deal deal) {
        return ResponseEntity.ok(crmService.createDeal(deal));
    }

    @PatchMapping("/deals/{id}/stage")
    public ResponseEntity<Deal> updateDealStage(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String stage = payload.get("stage");
        return ResponseEntity.ok(crmService.updateDealStage(id, stage));
    }
}

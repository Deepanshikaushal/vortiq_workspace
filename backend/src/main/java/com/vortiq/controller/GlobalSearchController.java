package com.vortiq.controller;

import com.vortiq.model.Project;
import com.vortiq.model.Task;
import com.vortiq.model.crm.Customer;
import com.vortiq.model.crm.Lead;
import com.vortiq.model.docs.DocumentVaultItem;
import com.vortiq.model.hr.EmployeeProfile;
import com.vortiq.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class GlobalSearchController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private EmployeeProfileRepository employeeRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private LeadRepository leadRepository;

    @Autowired
    private DocumentVaultRepository documentRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> globalSearch(@RequestParam String q) {
        String query = q.toLowerCase().trim();
        Map<String, Object> results = new HashMap<>();

        if (query.isEmpty()) {
            return ResponseEntity.ok(results);
        }

        List<Task> tasks = taskRepository.findAll().stream()
                .filter(t -> (t.getTitle() != null && t.getTitle().toLowerCase().contains(query)) ||
                             (t.getDescription() != null && t.getDescription().toLowerCase().contains(query)) ||
                             (t.getAssignee() != null && t.getAssignee().toLowerCase().contains(query)))
                .limit(5)
                .collect(Collectors.toList());

        List<Project> projects = projectRepository.findAll().stream()
                .filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(query)) ||
                             (p.getDescription() != null && p.getDescription().toLowerCase().contains(query)))
                .limit(5)
                .collect(Collectors.toList());

        List<EmployeeProfile> employees = employeeRepository.findAll().stream()
                .filter(e -> (e.getFullName() != null && e.getFullName().toLowerCase().contains(query)) ||
                             (e.getDepartment() != null && e.getDepartment().toLowerCase().contains(query)) ||
                             (e.getPosition() != null && e.getPosition().toLowerCase().contains(query)))
                .limit(5)
                .collect(Collectors.toList());

        List<Customer> customers = customerRepository.findAll().stream()
                .filter(c -> (c.getName() != null && c.getName().toLowerCase().contains(query)) ||
                             (c.getCompany() != null && c.getCompany().toLowerCase().contains(query)))
                .limit(5)
                .collect(Collectors.toList());

        List<Lead> leads = leadRepository.findAll().stream()
                .filter(l -> (l.getName() != null && l.getName().toLowerCase().contains(query)) ||
                             (l.getCompany() != null && l.getCompany().toLowerCase().contains(query)))
                .limit(5)
                .collect(Collectors.toList());

        List<DocumentVaultItem> documents = documentRepository.findAll().stream()
                .filter(d -> (d.getFileName() != null && d.getFileName().toLowerCase().contains(query)) ||
                             (d.getCategory() != null && d.getCategory().toLowerCase().contains(query)))
                .limit(5)
                .collect(Collectors.toList());

        results.put("query", q);
        results.put("tasks", tasks);
        results.put("projects", projects);
        results.put("employees", employees);
        results.put("customers", customers);
        results.put("leads", leads);
        results.put("documents", documents);
        results.put("totalMatches", tasks.size() + projects.size() + employees.size() + customers.size() + leads.size() + documents.size());

        return ResponseEntity.ok(results);
    }
}

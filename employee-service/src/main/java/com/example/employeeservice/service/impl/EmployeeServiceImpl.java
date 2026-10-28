package com.example.employeeservice.service.impl;

import com.example.employeeservice.entity.Employee;
import com.example.employeeservice.exception.ResourceNotFoundException;
import com.example.employeeservice.repository.EmployeeRepository;
import com.example.employeeservice.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Autowired
    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @Override
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee with ID " + id + " not found."));
    }

    @Override
    public Employee createEmployee(Employee employee) {
        if (employeeRepository.existsByEmail(employee.getEmail())) {
            throw new IllegalArgumentException("Employee with email '" + employee.getEmail() + "' already exists.");
        }
        return employeeRepository.save(employee);
    }

    @Override
    public Employee updateEmployee(Long id, Employee employeeDetails) {
        Employee existingEmployee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee with ID " + id + " not found."));

        // If email changed, check uniqueness
        if (!existingEmployee.getEmail().equalsIgnoreCase(employeeDetails.getEmail()) &&
                employeeRepository.existsByEmail(employeeDetails.getEmail())) {
            throw new IllegalArgumentException("Employee with email '" + employeeDetails.getEmail() + "' already exists.");
        }

        existingEmployee.setName(employeeDetails.getName());
        existingEmployee.setEmail(employeeDetails.getEmail());
        existingEmployee.setDepartment(employeeDetails.getDepartment());
        existingEmployee.setRole(employeeDetails.getRole());
        existingEmployee.setSalary(employeeDetails.getSalary());

        return employeeRepository.save(existingEmployee);
    }

    @Override
    public void deleteEmployee(Long id) {
        Employee existingEmployee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee with ID " + id + " not found."));
        employeeRepository.delete(existingEmployee);
    }
}

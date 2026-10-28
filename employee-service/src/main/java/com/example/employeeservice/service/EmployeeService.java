package com.example.employeeservice.service;

import com.example.employeeservice.entity.Employee;

import java.util.List;

public interface EmployeeService {
    List<Employee> getAllEmployees();
    Employee getEmployeeById(Long id);
    Employee createEmployee(Employee employee);
    Employee updateEmployee(Long id, Employee employeeDetails);
    void deleteEmployee(Long id);
}

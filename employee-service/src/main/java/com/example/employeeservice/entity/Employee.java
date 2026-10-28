package com.example.employeeservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Employee name cannot be blank")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Employee email cannot be blank")
    @Email(message = "Email must be a valid email address format")
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Department cannot be blank")
    @Column(nullable = false)
    private String department;

    @NotBlank(message = "Role cannot be blank")
    @Column(nullable = false)
    private String role;

    @NotNull(message = "Salary is required")
    @Positive(message = "Salary must be greater than zero")
    @Column(nullable = false)
    private Double salary;

    public Employee() {
    }

    public Employee(Long id, String name, String email, String department, String role, Double salary) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.department = department;
        this.role = role;
        this.salary = salary;
    }

    public Employee(String name, String email, String department, String role, Double salary) {
        this.name = name;
        this.email = email;
        this.department = department;
        this.role = role;
        this.salary = salary;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Double getSalary() {
        return salary;
    }

    public void setSalary(Double salary) {
        this.salary = salary;
    }

    @Override
    public String toString() {
        return "Employee{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", department='" + department + '\'' +
                ", role='" + role + '\'' +
                ", salary=" + salary +
                '}';
    }
}

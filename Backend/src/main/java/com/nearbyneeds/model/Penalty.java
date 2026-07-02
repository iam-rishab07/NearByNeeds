package com.nearbyneeds.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "penalties")
public class Penalty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;

    @Column(name = "offense_number", nullable = false)
    private Integer offenseNumber;

    @Column(name = "fine_amount", nullable = false)
    private Double fineAmount;

    @Column(name = "suspension_days")
    private Integer suspensionDays;

    @Column(name = "is_permanent_ban", nullable = false)
    private Boolean isPermanentBan = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum PaymentStatus {
        PENDING, PAID, WAIVED
    }

    public Penalty() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Issue getIssue() {
        return issue;
    }

    public void setIssue(Issue issue) {
        this.issue = issue;
    }

    public Integer getOffenseNumber() {
        return offenseNumber;
    }

    public void setOffenseNumber(Integer offenseNumber) {
        this.offenseNumber = offenseNumber;
    }

    public Double getFineAmount() {
        return fineAmount;
    }

    public void setFineAmount(Double fineAmount) {
        this.fineAmount = fineAmount;
    }

    public Integer getSuspensionDays() {
        return suspensionDays;
    }

    public void setSuspensionDays(Integer suspensionDays) {
        this.suspensionDays = suspensionDays;
    }

    public Boolean getIsPermanentBan() {
        return isPermanentBan;
    }

    public void setIsPermanentBan(Boolean permanentBan) {
        isPermanentBan = permanentBan;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}

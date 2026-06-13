package com.example.minsung.demo.dto.memberDto;

import java.time.LocalDateTime;

import com.example.minsung.demo.entity.Member;

import lombok.Getter;

@Getter
public class AdminMemberResponseDto {
    private final Long memberId;
    private final String loginId;
    private final String email;
    private final String name;
    private final String phone;
    private final String role;
    private final LocalDateTime createdAt;
    private final String adminMemo;
    private final Integer rewardPoints;
    private final Integer couponCount;
    private final Boolean blacklisted;
    private final Long totalPurchaseAmount;
    private final LocalDateTime lastLoginAt;

    public AdminMemberResponseDto(Member member) {
        this.memberId = member.getMemberId();
        this.loginId = member.getLoginId();
        this.email = member.getEmail();
        this.name = member.getName();
        this.phone = member.getPhone();
        this.role = member.getRole();
        this.createdAt = member.getCreatedAt();
        this.adminMemo = member.getAdminMemo();
        this.rewardPoints = member.getRewardPoints();
        this.couponCount = member.getCouponCount();
        this.blacklisted = member.getBlacklisted();
        this.totalPurchaseAmount = member.getTotalPurchaseAmount();
        this.lastLoginAt = member.getLastLoginAt();
    }
}

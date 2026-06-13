package com.example.minsung.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.minsung.demo.dto.memberDto.AdminMemberMemoRequestDto;
import com.example.minsung.demo.dto.memberDto.AdminMemberResponseDto;
import com.example.minsung.demo.dto.memberDto.AdminMemberBenefitRequestDto;
import com.example.minsung.demo.dto.memberDto.AdminMemberBlacklistRequestDto;
import com.example.minsung.demo.service.memberService.MemberService;

@RestController
@RequestMapping("/api/admin/members")
public class AdminMemberController {

    private final MemberService memberService;

    public AdminMemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping
    public ResponseEntity<List<AdminMemberResponseDto>> getMembers() {
        return ResponseEntity.ok(memberService.getAdminMembers());
    }

    @PatchMapping("/{memberId}/memo")
    public ResponseEntity<AdminMemberResponseDto> updateMemo(
            @PathVariable("memberId") Long memberId,
            @RequestBody AdminMemberMemoRequestDto request
    ) {
        return ResponseEntity.ok(memberService.updateAdminMemo(memberId, request.getAdminMemo()));
    }

    @PatchMapping("/{memberId}/benefits")
    public ResponseEntity<AdminMemberResponseDto> addBenefits(
            @PathVariable("memberId") Long memberId,
            @RequestBody AdminMemberBenefitRequestDto request
    ) {
        return ResponseEntity.ok(memberService.addAdminBenefit(
                memberId,
                request.getRewardPoints(),
                request.getCouponCount()
        ));
    }

    @PatchMapping("/{memberId}/blacklist")
    public ResponseEntity<AdminMemberResponseDto> updateBlacklist(
            @PathVariable("memberId") Long memberId,
            @RequestBody AdminMemberBlacklistRequestDto request
    ) {
        return ResponseEntity.ok(memberService.updateBlacklist(memberId, request.getBlacklisted()));
    }
}

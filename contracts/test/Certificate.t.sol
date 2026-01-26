// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {CertificateRegistry} from "../contracts/Certificate.sol";
import {Test} from "forge-std/src/Test.sol";

contract CertificateRegistryTest is Test {
    CertificateRegistry registry;

    address deployer = address(1);
    address admin2 = address(2);
    address student1 = address(3);
    address randomUser = address(4);

    function setUp() public {
        vm.prank(deployer);
        registry = new CertificateRegistry();
    }

    // ============ Admin Tests ============

    function test_DeployerIsAdmin() public view {
        assertTrue(registry.admins(deployer));
    }

    function test_AddAdmin() public {
        vm.prank(deployer);
        registry.addAdmin(admin2);
        assertTrue(registry.admins(admin2));
    }

    function test_AddAdmin_RevertIfNotAdmin() public {
        vm.prank(randomUser);
        vm.expectRevert("Only admins can perform this action");
        registry.addAdmin(admin2);
    }

    function test_RemoveAdmin() public {
        vm.prank(deployer);
        registry.addAdmin(admin2);

        vm.prank(deployer);
        registry.removeAdmin(admin2);
        assertFalse(registry.admins(admin2));
    }

    // ============ Certificate Creation ============

    function test_NewCertificate() public {
        vm.prank(deployer);
        registry.newCertificate("Alice", "Blockchain 101", 2024, 95, student1);

        CertificateRegistry.Certificate memory cert = registry.getCertificate(0);
        assertEq(cert.id, 0);
        assertEq(cert.studentName, "Alice");
        assertEq(cert.certificateName, "Blockchain 101");
        assertEq(cert.year, 2024);
        assertEq(cert.score, 95);
        assertEq(cert.student, student1);
        assertEq(cert.issuer, deployer);
        assertTrue(cert.valid);
    }

    function test_NewCertificate_RevertIfNotAdmin() public {
        vm.prank(randomUser);
        vm.expectRevert("Only admins can perform this action");
        registry.newCertificate("Alice", "Blockchain 101", 2024, 95, student1);
    }

    // ============ Certificate Revocation ============

    function test_RevokeCertificate() public {
        vm.prank(deployer);
        registry.newCertificate("Alice", "Blockchain 101", 2024, 95, student1);

        vm.prank(deployer);
        registry.revokeCertificate(0);

        assertFalse(registry.getCertificate(0).valid);
    }

    function test_RevokeCertificate_RevertIfNotFound() public {
        vm.prank(deployer);
        vm.expectRevert("Certificate not found");
        registry.revokeCertificate(999);
    }

    // ============ Verification ============

    function test_VerifyCertificate_ByName() public {
        vm.prank(deployer);
        registry.newCertificate("Alice", "Blockchain 101", 2024, 95, student1);

        assertTrue(registry.verifyCertificate("Alice", "Blockchain 101"));
        assertFalse(registry.verifyCertificate("Alice", "Wrong Course"));
        assertFalse(registry.verifyCertificate("Bob", "Blockchain 101"));
    }

    function test_VerifyCertificate_ByAddress() public {
        vm.prank(deployer);
        registry.newCertificate("Alice", "Blockchain 101", 2024, 95, student1);

        assertTrue(registry.verifyCertificateByAddress(student1, "Blockchain 101"));
        assertFalse(registry.verifyCertificateByAddress(student1, "Wrong Course"));
        assertFalse(registry.verifyCertificateByAddress(randomUser, "Blockchain 101"));
    }

    function test_VerifyCertificate_ReturnsFalseAfterRevocation() public {
        vm.prank(deployer);
        registry.newCertificate("Alice", "Blockchain 101", 2024, 95, student1);

        assertTrue(registry.verifyCertificate("Alice", "Blockchain 101"));

        vm.prank(deployer);
        registry.revokeCertificate(0);

        assertFalse(registry.verifyCertificate("Alice", "Blockchain 101"));
    }
}

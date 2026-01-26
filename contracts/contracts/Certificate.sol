// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract CertificateRegistry {
    uint256 public x;

    struct Certificate {
        uint256 id;
        string studentName;
        string certificateName;
        uint256 year;
        uint256 score;
        address student;
        address issuer;
        bool valid;
    }

    mapping(address => bool) public admins;

    Certificate[] public certificates;

    constructor() {
        admins[msg.sender] = true;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admins can perform this action");
        _;
    }

    // Could add voting functionality, so one admin cannot destroy the system, and we need 50% of admin to agree to add/remove an admin
    function addAdmin(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        require(newAdmin != msg.sender, "Cannot add yourself as admin");
        admins[newAdmin] = true;
        emit AdminAdded(newAdmin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        require(admins[admin], "Admin not found");
        admins[admin] = false;
        emit AdminRemoved(admin);
    }

    function newCertificate(
        string memory student_name,
        string memory certificate_name,
        uint256 year,
        uint256 score,
        address student
    ) public onlyAdmin {
        uint256 id = certificates.length;
        certificates.push(
            Certificate(
                id, student_name, certificate_name, year, score, student, msg.sender, true
            )
        );

        emit CertificateAdded(
            id, student_name, certificate_name, year, score, student, msg.sender
        );
    }

    function revokeCertificate(uint256 id) public onlyAdmin {
        require(id < certificates.length, "Certificate not found");
        certificates[id].valid = false;

        emit CertificateRevoked(id);
    }

    function verifyCertificate(string memory student_name, string memory certificate_name) public view returns (bool) {
        for (uint256 i = 0; i < certificates.length; i++) {
            if (compareStrings(certificates[i].studentName, student_name) && compareStrings(certificates[i].certificateName, certificate_name) && certificates[i].valid) {
                return true;
            }
        }
        return false;
    }

    // bigger cost, but might be useful as a proof of ownership
    function verifyCertificateByAddress(address student, string memory certificate_name)
        public
        view
        returns (bool)
    {
        for (uint256 i = 0; i < certificates.length; i++) {
            if (certificates[i].student == student && compareStrings(certificates[i].certificateName, certificate_name) && certificates[i].valid) {
                return true;
            }
        }
        return false;
    }

    function getCertificatesByAddress(address student) public view returns (Certificate[] memory) {
        uint count = 0;

        for (uint256 i = 0; i < certificates.length; i++) {
            if (certificates[i].student == student && certificates[i].valid) {
                count++;
            }
        }

        Certificate[] memory result = new Certificate[](count);
        uint index = 0;
        for (uint256 i = 0; i < certificates.length; i++) {
            if (certificates[i].student == student && certificates[i].valid) {
                result[index] = certificates[i];
                index ++;
            }
        }
        return result;
    }

    function getCertificate(uint256 id)
        public
        view
        returns (Certificate memory)
    {
        require(id < certificates.length, "Certificate not found");
        return certificates[id];
    }

    function compareStrings(string memory str1, string memory str2) public pure returns (bool) {
        return keccak256(bytes(str1)) == keccak256(bytes(str2));
    }

    event CertificateAdded(
        uint256 id,
        string student_name,
        string certificate_name,
        uint256 year,
        uint256 score,
        address student,
        address issuer
    );
    event CertificateRevoked(uint256 id);
    event AdminAdded(address admin);
    event AdminRemoved(address admin);
}

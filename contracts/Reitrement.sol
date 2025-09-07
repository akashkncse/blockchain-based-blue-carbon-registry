// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CarbonRegistry.sol";

contract Retirement is Ownable {
    struct RetirementRecord {
        address owner;
        string beneficiary;
        uint amount;
        uint retirementDate;
        uint sourceCertificateId;
    }

    mapping(uint => RetirementRecord) public retirements;
    uint public nextRetirementId = 1;
    CarbonRegistry public registry;

    event CreditRetired(
        uint indexed retirementId,
        address indexed owner,
        string beneficiary,
        uint amount,
        uint indexed sourceCertificateId
    );

    constructor(address _registry)
        Ownable(msg.sender)   // required for OZ v5.x
    {
        require(_registry != address(0), "registry required");
        registry = CarbonRegistry(_registry);
    }

    function retire(uint sourceCertificateId, uint amount, string memory beneficiary) external {
        require(amount > 0, "Amount must be > 0");

        uint creditTokenId = registry.getCreditTokenId(sourceCertificateId);
        require(creditTokenId != 0, "Invalid certificate ID");

        // must approve Retirement contract as operator first
        require(registry.isApprovedForAll(msg.sender, address(this)), "Approve retirement contract to manage credits");

        registry.burn(msg.sender, creditTokenId, amount);

        uint retirementId = nextRetirementId++;
        retirements[retirementId] = RetirementRecord(msg.sender, beneficiary, amount, block.timestamp, sourceCertificateId);

        emit CreditRetired(retirementId, msg.sender, beneficiary, amount, sourceCertificateId);
    }

    function setRegistry(address _registry) external onlyOwner {
        require(_registry != address(0), "invalid address");
        registry = CarbonRegistry(_registry);
    }

    function getRetirement(uint retirementId) external view returns (RetirementRecord memory) {
        return retirements[retirementId];
    }
}

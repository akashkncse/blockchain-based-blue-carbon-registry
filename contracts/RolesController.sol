// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract RolesController is AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant NGO_ROLE = keccak256("NGO_ROLE");

    constructor() {
        // deployer becomes DEFAULT_ADMIN_ROLE
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // convenience functions (optional, still checks DEFAULT_ADMIN_ROLE)
    function grantVerifier(address account) external {
        grantRole(VERIFIER_ROLE, account);
    }

    function revokeVerifier(address account) external {
        revokeRole(VERIFIER_ROLE, account);
    }

    function grantNGO(address account) external {
        grantRole(NGO_ROLE, account);
    }

    function revokeNGO(address account) external {
        revokeRole(NGO_ROLE, account);
    }
}

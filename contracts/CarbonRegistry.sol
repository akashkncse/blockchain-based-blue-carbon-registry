// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RolesController.sol";

contract CarbonRegistry is ERC1155, ERC1155Burnable, Ownable {
    enum Status {
        Pending,
        Approved,
        Rejected
    }

    struct Project {
        string name;
        string metadataCid;
        address owner;
    }

    struct Proof {
        uint projectId;
        string evidenceCid;
        uint reportedTonnes;
        uint verifiedTonnes;
        Status proofStatus;
        address submittedBy;
    }

    mapping(uint => Project) public projects;
    mapping(uint => Proof) public proofs;
    mapping(uint => string) private tokenUris;
    mapping(uint => uint) public certificateToCreditToken;

    uint public nextProjectId = 1;
    uint public nextProofId = 1;
    uint public nextTokenId = 1;

    RolesController public rolesController;

    event ProjectRegistered(
        uint indexed projectId,
        address indexed owner,
        string name,
        string metadataCid
    );
    event ProofSubmitted(
        uint indexed proofId,
        uint indexed projectId,
        string evidenceCid,
        uint reportedTonnes
    );
    event Issued(
        uint indexed certificateId,
        uint indexed projectId,
        address indexed verifier,
        uint creditTokenId,
        uint amount,
        string uri
    );

    constructor(
        address _rolesController
    )
        ERC1155("")
        Ownable(msg.sender) // required for OZ v5.x
    {
        require(_rolesController != address(0), "roles controller required");
        rolesController = RolesController(_rolesController);
    }

    modifier onlyNGO() {
        require(
            rolesController.hasRole(rolesController.NGO_ROLE(), msg.sender),
            "Caller is not an NGO"
        );
        _;
    }

    modifier onlyVerifier() {
        require(
            rolesController.hasRole(
                rolesController.VERIFIER_ROLE(),
                msg.sender
            ),
            "Caller is not a verifier"
        );
        _;
    }

    function registerProject(
        string memory name,
        string memory metadataCid
    ) external onlyNGO {
        uint projectId = nextProjectId++;
        projects[projectId] = Project(name, metadataCid, msg.sender);
        emit ProjectRegistered(projectId, msg.sender, name, metadataCid);
    }

    function submitProof(
        uint projectId,
        string memory evidenceCid,
        uint reportedTonnes
    ) external onlyNGO {
        require(projects[projectId].owner == msg.sender, "Not project owner");
        uint proofId = nextProofId++;
        proofs[proofId] = Proof(
            projectId,
            evidenceCid,
            reportedTonnes,
            0,
            Status.Pending,
            msg.sender
        );
        emit ProofSubmitted(proofId, projectId, evidenceCid, reportedTonnes);
    }

    function approveAndIssue(
        uint proofId,
        uint verifiedTonnes,
        string memory certificateUri
    ) external onlyVerifier {
        Proof storage proof = proofs[proofId];
        require(proof.proofStatus == Status.Pending, "Proof not pending");

        proof.proofStatus = Status.Approved;
        proof.verifiedTonnes = verifiedTonnes;

        uint certificateId = nextTokenId++;
        uint creditTokenId = nextTokenId++;
        certificateToCreditToken[certificateId] = creditTokenId;

        address projectOwner = projects[proof.projectId].owner;
        require(projectOwner != address(0), "Project owner not set");

        _mint(projectOwner, certificateId, 1, "");
        if (verifiedTonnes > 0) {
            _mint(projectOwner, creditTokenId, verifiedTonnes, "");
        }

        tokenUris[certificateId] = certificateUri;
        tokenUris[creditTokenId] = certificateUri;

        emit Issued(
            certificateId,
            proof.projectId,
            msg.sender,
            creditTokenId,
            verifiedTonnes,
            certificateUri
        );
    }

    function getCreditTokenId(uint certificateId) external view returns (uint) {
        return certificateToCreditToken[certificateId];
    }

    function uri(
        uint256 id
    ) public view virtual override returns (string memory) {
        return tokenUris[id];
    }

    function setTokenUri(
        uint tokenId,
        string memory newUri
    ) external onlyOwner {
        tokenUris[tokenId] = newUri;
    }

    function getProject(uint projectId) external view returns (Project memory) {
        return projects[projectId];
    }

    function getProof(uint proofId) external view returns (Proof memory) {
        return proofs[proofId];
    }
}

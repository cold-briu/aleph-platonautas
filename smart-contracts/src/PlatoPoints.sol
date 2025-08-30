// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PlatoPoints is ERC20 {
    constructor() ERC20("PlatoPoints", "PLATO") {}
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    
    function transfer(address to, uint256 amount) public override returns (bool) {
        revert("Soulbound: transfers not allowed");
    }
    
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        revert("Soulbound: transfers not allowed");
    }
    
    function approve(address spender, uint256 amount) public override returns (bool) {
        revert("Soulbound: approvals not allowed");
    }
}

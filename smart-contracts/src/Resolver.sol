//// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import {SchemaResolver} from "eas-contracts/resolver/SchemaResolver.sol";
import { IEAS, Attestation } from "eas-contracts/IEAS.sol";

contract Resolver is SchemaResolver {

    constructor(IEAS eas) SchemaResolver(eas) {
    }

    function onAttest(Attestation calldata attestation, uint256 /*value*/) internal view override returns (bool) {
        return true;
    }

    function onRevoke(Attestation calldata /*attestation*/, uint256 /*value*/) internal pure override returns (bool) {
        return true;
    }


}



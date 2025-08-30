//// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import {SchemaResolver} from "eas-contracts/resolver/SchemaResolver.sol";
import { IEAS, Attestation } from "eas-contracts/IEAS.sol";
import {PlatoPoints} from "./PlatoPoints.sol";

contract Resolver is SchemaResolver {

    PlatoPoints private _platopoints;

    constructor(IEAS eas, PlatoPoints platoPoints) SchemaResolver(eas) {
      _platopoints = platoPoints;
    }

    function onAttest(Attestation calldata attestation, uint256 /*value*/) internal  override returns (bool) {
      _platopoints.mint(attestation.recipient, 20);
      return true;
    }

    function onRevoke(Attestation calldata /*attestation*/, uint256 /*value*/) internal pure override returns (bool) {
        return true;
    }


}



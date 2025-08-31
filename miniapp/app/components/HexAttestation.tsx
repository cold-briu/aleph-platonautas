import { useState } from "react";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { Button } from "./Button";
import { Card } from "./Card";
import { useAccount, useWalletClient } from "wagmi";
import { viemToEthersSigner } from "../../lib/viemToEthers";

interface HexAttestationProps {
    hex?: string;
}

export function HexAttestation({ hex: initialHex = "" }: HexAttestationProps) {
    const [hex, setHex] = useState(initialHex);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [attestationResult, setAttestationResult] = useState("");

    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();

    const easContractAddress = "0x4200000000000000000000000000000000000021";
    const schemaUID = "0xdf4c41ea0f6263c72aa385580124f41f2898d3613e86c50519fc3cfd7ff13ad4";

    // Validate hex input
    const validateHex = (input: string): boolean => {
        // Check if it's a valid hex string (with or without 0x prefix)
        const hexPattern = /^(0x)?[0-9a-fA-F]+$/;
        return hexPattern.test(input);
    };

    // Ensure hex is properly formatted as bytes32
    const formatHexAsBytes32 = (input: string): string => {
        // Remove 0x prefix if present
        let cleanHex = input.startsWith('0x') ? input.slice(2) : input;
        // Pad to 64 characters (32 bytes)
        cleanHex = cleanHex.padEnd(64, '0');
        // Add 0x prefix
        return '0x' + cleanHex;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        setAttestationResult("");

        try {
            if (!walletClient) {
                throw new Error("Wallet not connected");
            }

            // Convert viem WalletClient to ethers Signer
            const signer = await viemToEthersSigner(walletClient);
            if (!signer) {
                throw new Error("Failed to get signer from wallet");
            }

            const eas = new EAS(easContractAddress);
            // Connect EAS with ethers signer
            await eas.connect(signer);

            if (!hex) {
                throw new Error("No hex data provided. Please enter a valid hex string.");
            }

            if (!validateHex(hex)) {
                throw new Error("Invalid hex format. Please enter a valid hex string.");
            }

            const formattedHex = formatHexAsBytes32(hex);

            // Initialize SchemaEncoder with the schema string
            const schemaEncoder = new SchemaEncoder("bytes32 contentHash");
            const encodedData = schemaEncoder.encodeData([
                { name: "contentHash", value: formattedHex, type: "bytes32" }
            ]);

            const tx = await eas.attest({
                schema: schemaUID,
                data: {
                    recipient: "0x0000000000000000000000000000000000000000",
                    expirationTime: BigInt(0),
                    revocable: true,
                    data: encodedData,
                },
            });

            const newAttestationUID = await tx.wait();
            console.log("New attestation UID:", newAttestationUID);
            setAttestationResult(`Attestation successful! UID: ${newAttestationUID}`);
        } catch (error) {
            console.error("Error submitting attestation:", error);
            setError(error instanceof Error ? error.message : "An unknown error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card title="Hex Attestation">
            <div className="space-y-4">
                <p className="text-[var(--app-foreground-muted)] text-sm">
                    Enter a hex string to submit as an attestation.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="hex"
                            className="block text-sm font-medium text-[var(--app-foreground)]"
                        >
                            Hex Value
                        </label>
                        <input
                            type="text"
                            id="hex"
                            value={hex}
                            onChange={(e) => {
                                setHex(e.target.value);
                                setError(""); // Clear error when user types
                            }}
                            placeholder="0x1234567890abcdef..."
                            required
                            className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] focus:border-transparent transition-colors font-mono"
                        />
                    </div>

                    {/* Hex Preview */}
                    {hex && validateHex(hex) && (
                        <div className="space-y-3 p-4 bg-[var(--app-gray)] rounded-lg">
                            <h4 className="text-sm font-medium text-[var(--app-foreground)]">Formatted Hex (bytes32):</h4>
                            <div className="text-sm">
                                <span className="text-[var(--app-foreground-muted)] font-mono text-xs break-all">
                                    {formatHexAsBytes32(hex)}
                                </span>
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting || !address || !walletClient || !hex || !validateHex(hex)}
                        className="w-full"
                    >
                        {!address
                            ? "Connect Wallet"
                            : !hex
                                ? "Enter Hex Value"
                                : !validateHex(hex)
                                    ? "Invalid Hex Format"
                                    : isSubmitting
                                        ? "Submitting..."
                                        : "Submit Attestation"
                        }
                    </Button>

                    {attestationResult && (
                        <span className="block text-sm text-green-600 mt-2 p-2 bg-green-50 border border-green-200 rounded">
                            {attestationResult}
                        </span>
                    )}

                    {error && (
                        <span className="block text-sm text-red-500 mt-2">
                            {error}
                        </span>
                    )}
                </form>
            </div>
        </Card>
    );
}

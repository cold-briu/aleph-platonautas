import { useState } from "react";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { Button } from "./Button";
import { Card } from "./Card";
import { useAccount, useWalletClient } from "wagmi";
import { viemToEthersSigner } from "../../lib/viemToEthers";


export function HexAttestation() {
    const [url, setUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [attestationResult, setAttestationResult] = useState("");
    const [processedData, setProcessedData] = useState({
        extractedParts: "",
        combinedString: "",
        hexBytes32: ""
    });

    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();

    const easContractAddress = "0x4200000000000000000000000000000000000021";
    const schemaUID = "0xdf4c41ea0f6263c72aa385580124f41f2898d3613e86c50519fc3cfd7ff13ad4";

    // Process URL to extract parts and convert to bytes32
    const processUrl = (inputUrl: string) => {
        try {
            // Extract last 2 sections from URL
            const urlParts = inputUrl.trim().split('/').filter(part => part.length > 0);
            if (urlParts.length < 2) {
                throw new Error("URL must have at least 2 path segments");
            }

            const lastTwoParts = urlParts.slice(-2);
            const extractedParts = `${lastTwoParts[0]}, ${lastTwoParts[1]}`;

            // Combine parts with space
            const combinedString = lastTwoParts.join(' ');

            // Convert to hex bytes32 (pad with zeros)
            const encoder = new TextEncoder();
            const bytes = encoder.encode(combinedString);
            const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
            const hexBytes32 = '0x' + hex.padEnd(64, '0'); // 32 bytes = 64 hex characters

            setProcessedData({
                extractedParts,
                combinedString,
                hexBytes32
            });

            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error processing URL");
            setProcessedData({
                extractedParts: "",
                combinedString: "",
                hexBytes32: ""
            });
        }
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

            if (!processedData.hexBytes32) {
                throw new Error("No processed hex data available. Please enter a valid URL first.");
            }

            // Initialize SchemaEncoder with the schema string
            const schemaEncoder = new SchemaEncoder("bytes32 contentHash");
            const encodedData = schemaEncoder.encodeData([
                { name: "contentHash", value: processedData.hexBytes32, type: "bytes32" }
            ]);

            const tx = await eas.attest({
                schema: schemaUID,
                data: {
                    recipient: "0x0000000000000000000000000000000000000000",
                    expirationTime: 0,
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
        <Card title="URL to Hex Attestation">
            <div className="space-y-4">
                <p className="text-[var(--app-foreground-muted)] text-sm">
                    Enter a URL to extract the last 2 segments, convert to hex, and submit as an attestation.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="url"
                            className="block text-sm font-medium text-[var(--app-foreground)]"
                        >
                            URL
                        </label>
                        <input
                            type="url"
                            id="url"
                            value={url}
                            onChange={(e) => {
                                setUrl(e.target.value);
                                if (e.target.value) {
                                    processUrl(e.target.value);
                                }
                            }}
                            placeholder="https://farcaster.xyz/sandusky/0x78e0db62"
                            required
                            className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] focus:border-transparent transition-colors"
                        />
                    </div>

                    {/* Processing Steps Display */}
                    {processedData.extractedParts && (
                        <div className="space-y-3 p-4 bg-[var(--app-gray)] rounded-lg">
                            <h4 className="text-sm font-medium text-[var(--app-foreground)]">Processing Steps:</h4>

                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="font-medium text-[var(--app-foreground)]">1. Extracted parts:</span>
                                    <span className="ml-2 text-[var(--app-foreground-muted)]">{processedData.extractedParts}</span>
                                </div>

                                <div>
                                    <span className="font-medium text-[var(--app-foreground)]">2. Combined string:</span>
                                    <span className="ml-2 text-[var(--app-foreground-muted)]">"{processedData.combinedString}"</span>
                                </div>

                                <div>
                                    <span className="font-medium text-[var(--app-foreground)]">3. Hex bytes32:</span>
                                    <span className="ml-2 text-[var(--app-foreground-muted)] font-mono text-xs break-all">{processedData.hexBytes32}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting || !address || !walletClient || !processedData.hexBytes32}
                        className="w-full"
                    >
                        {!address
                            ? "Connect Wallet"
                            : !processedData.hexBytes32
                                ? "Enter URL to Process"
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

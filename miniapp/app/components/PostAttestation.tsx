import { useViewCast, useComposeCast } from '@coinbase/onchainkit/minikit';
import { useState } from 'react';
import { Button } from "./Button";
import { Card } from "./Card";
import { HexAttestation } from "./HexAttestation";

export function PostAttestation() {
    const [sharedCastHash, setSharedCastHash] = useState<string | null>(null);
    const [castResult, setCastResult] = useState<string>("");

    const { composeCast: composeCastMutation, isPending: isComposing } = useComposeCast();
    const { viewCast: viewCastMutation } = useViewCast();

    const shareHelloWorld = () => {
        const timestamp = new Date().toISOString();

        composeCastMutation({
            text: `Hello World! 🌍 Posted at ${timestamp}`,
            embeds: [window.location.href]
        }, {
            onSuccess: (data) => {
                // The actual cast hash would come from the response data
                const castHash = data?.cast?.hash || `no hash _${Date.now()}`;
                setSharedCastHash(castHash);
                setCastResult(JSON.stringify(data, null, 2));
            },
            onError: (error) => {
                console.error("Error sharing cast:", error);
                setCastResult("Failed to share cast. Please try again.");
            }
        });
    };

    const viewCast = () => {
        if (sharedCastHash) {
            viewCastMutation({
                hash: sharedCastHash,
                close: false
            });
        }
    };

    return (
        <Card title="Post Attestation">
            <div className="space-y-4">
                <p className="text-[var(--app-foreground-muted)] text-sm">
                    Share a Hello World message with timestamp to Farcaster. Use the HexAttestation component below to create an attestation for the cast hash.
                </p>

                <div className="space-y-3">
                    <Button
                        onClick={shareHelloWorld}
                        disabled={isComposing}
                        className="w-full"
                    >
                        {isComposing ? "Posting Cast..." : "Hello World"}
                    </Button>

                    {castResult && (
                        <div className="p-3 bg-[var(--app-gray)] rounded-lg">
                            <h4 className="text-sm font-medium text-[var(--app-foreground)] mb-2">Cast Result:</h4>
                            <p className="text-sm text-[var(--app-foreground-muted)] font-mono text-xs break-all">
                                {JSON.stringify(castResult, null, 2)}
                            </p>
                        </div>
                    )}

                    {sharedCastHash && !sharedCastHash.startsWith('no hash') && (
                        <Button
                            onClick={viewCast}
                            variant="secondary"
                            className="w-full"
                        >
                            View Cast
                        </Button>
                    )}
                </div>

                {/* Show HexAttestation component with cast hash pre-filled */}
                {sharedCastHash && !sharedCastHash.startsWith('no hash') && (
                    <div className="mt-6">
                        <HexAttestation hex={sharedCastHash} />
                    </div>
                )}
            </div>
        </Card>
    );
}

"use client";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { HexAttestation } from "../components/HexAttestation";
import { Icon } from "../components/Icon";
import { TransactionCard } from "../components/TransactionCard";

type HomeProps = {
    setActiveTab: (tab: string) => void;
};

export function Home({ setActiveTab }: HomeProps) {
    return (
        <div className="space-y-6 animate-fade-in">
            <HexAttestation />

            <TransactionCard />

        </div>
    );
}

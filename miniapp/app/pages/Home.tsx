"use client";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Icon } from "../components/Icon";
import { PostAttestation } from "../components/PostAttestation";
import { TransactionCard } from "../components/TransactionCard";

type HomeProps = {
    setActiveTab: (tab: string) => void;
};

export function Home({ setActiveTab }: HomeProps) {
    return (
        <div className="space-y-6 animate-fade-in">
            <PostAttestation />

            <TransactionCard />

        </div>
    );
}

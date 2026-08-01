"use client";

import { useEffect, useMemo, useState } from "react";

type ImageRow = {
    oldName: string;
    newUrl: string;
};

type ApiResponse = {
    success: boolean;
    data?: ImageRow[];
    error?: string;
};

export default function AdminImagesPage() {
    const [rows, setRows] = useState<ImageRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadImages() {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch("/api/admin/images/mapped");
                const payload = (await response.json()) as ApiResponse;

                if (!response.ok || !payload.success) {
                    throw new Error(payload.error || "Failed to load images");
                }

                setRows(Array.isArray(payload.data) ? payload.data : []);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load images");
                setRows([]);
            } finally {
                setLoading(false);
            }
        }

        void loadImages();
    }, []);

    const stats = useMemo(() => {
        return {
            total: rows.length,
            withUrl: rows.filter((row) => !!row.newUrl).length,  // Fix field name
            withoutUrl: rows.filter((row) => !row.newUrl).length, // Fix field name
        };
    }, [rows]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            {/* Using useMemo result */}
            <div style={{ marginBottom: "10px" }}>
                <strong>Total:</strong> {stats.total} |{" "}
                <strong>With URL:</strong> {stats.withUrl} |{" "}
                <strong>Missing URL:</strong> {stats.withoutUrl}
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Old Name</th>
                        <th>New URL</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.oldName}>
                            <td>{row.oldName}</td>
                            <td>{row.newUrl}</td>
                            <td>
                            <img src={row.newUrl} alt={row.newUrl} width="400px" height={400}/>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
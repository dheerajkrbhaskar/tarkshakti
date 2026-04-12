export function parseDbTimestamp(value: string | null | undefined): Date {
    if (!value) {
        return new Date(0)
    }

    // Some DB timestamp strings may come without timezone info.
    // Treat those as UTC to avoid local-time offset bugs.
    const hasTimezone = /Z$|[+-]\d{2}:?\d{2}$/.test(value)
    return new Date(hasTimezone ? value : `${value}Z`)
}
export async function findAsyncSequential<T>(
    array: T[],
    predicate: (t: T) => Promise<boolean>,
): Promise<T | undefined> {
    for (const t of array) {
        if (await predicate(t)) {
            return t;
        }
    }
    return undefined;
}

export async function mapAsyncSequential<T, G>(
    array: T[],
    predicate: (t: T) => Promise<G>,
): Promise<G[]> {
    const result: G[] = [];
    for (const t of array) {
        result.push(await predicate(t));
    }
    return result;
}

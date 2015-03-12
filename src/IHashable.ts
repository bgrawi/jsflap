module jsflap {

    /**
     * Allows for hashing an object
     */
    export interface IHashable {
        hashCode(): string;
        toString(): string;
    }
}
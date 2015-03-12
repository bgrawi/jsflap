///<reference path='IHashable.ts' />
module jsflap {

    export interface IOrderedHashmap<T extends IHashable> {
        has(item: T): boolean;
        has(item: string): boolean;
        get(item: T): T;
        get(item: string): T;
        getByHash(hashCode: string): T;
        hasByHash(hashCode: string): boolean;
        getByString(str: string): T;
        hasByString(str: string): boolean;
        remove(item: T): boolean;
        remove(item: string): boolean;
    }

    export class OrderedHashmap<T extends IHashable> implements IOrderedHashmap<T> {

        /**
         * The actual array of items
         */
        public items: Array<T>;

        /**
         * The actual map
         */
        public itemMap: Object;

        /**
         * Create a new OrderedHashmap
         * @param items
         */
        constructor(items?: Array<T>) {
            this.items = [];
            this.itemMap = {};
            if(items) {
                items.forEach((item) => {
                    this.add(item)
                });
            }
        }

        /**
         * Adds a new item to the list
         * @param item
         * @param index
         */
        public add(item: T, index?: number): T {
            if(!this.has(item)) {
                if(typeof index !== 'number') {
                    this.items.push(item);
                } else {
                    this.items.splice(index, 0, item);
                }
                this.itemMap[item.hashCode()] = item;
                return item;
            } else {
                return this.get(item);
            }
        }

        /**
         * Checks if the item list has a item
         * @returns {boolean}
         * @param item
         */
        public has(item: any) {
            if(typeof item === 'string') {
                return this.hasByHash(item) || this.hasByString(item);
            } else if(typeof item === 'object') {
                return this.hasByHash((<T> item).hashCode()) || this.hasByString((<T> item).toString());
            } else {
                return false;
            }
        }

        /**
         * Gets an item by a similar item object
         * @param item
         * @returns {*}
         */
        public get(item: any): T {
            if(typeof item === 'string') {
                return this.getByHash(item) || this.getByString(item);
            } else if(typeof item === 'object') {
                return this.getByHash((<T> item).hashCode()) || this.getByString((<T> item).toString())
            } else {
                return null;
            }
        }

        /**
         * Removes a item from the list
         * @param item
         */
        public remove(item: any): boolean {
            var itemObject = this.get(item);
            if(!itemObject) {
                return false;
            }
            var itemHash = itemObject.hashCode();
            this.items.splice(this.items.indexOf(itemObject), 1);
            delete this.itemMap[itemHash];
            return true;
        }

        /**
         * Gets an item by hash code
         * @param hashCode
         * @returns {any}
         */
        public getByHash(hashCode: string): T {
            if(this.hasByHash(hashCode)) {
                return this.itemMap[hashCode];
            } else {
                return null;
            }
        }

        /**
         * Determines if the collection has by the hash code
         * @param hashCode
         * @returns {boolean}
         */
        public hasByHash(hashCode: string): boolean {
            return this.itemMap.hasOwnProperty(hashCode);
        }

        /**
         * Gets an item by name
         * @param str
         * @returns {any}
         */
        public getByString(str: string): T {
            for (var hashCode in this.itemMap) {
                if(this.itemMap.hasOwnProperty(hashCode) && this.itemMap[hashCode].toString() === str) {
                    return this.itemMap[hashCode];
                }
            }
            return null;
        }

        /**
         * Determines if the collection has by the name
         * @param str
         * @returns {boolean}
         */
        public hasByString(str: string): boolean {
            return this.getByString(str) !== null;
        }

        /**
         * Gets the number of items
         * @returns {number}
         */
        get size() {
            return this.items.length;
        }
    }
}
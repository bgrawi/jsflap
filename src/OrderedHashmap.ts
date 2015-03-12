module jsflap {

    export interface IOrderedHashmap<T extends IHashable> {
        has(item: T): boolean;
        has(item: string): boolean;
        get(item: T): T;
        get(item: string): T;
    }

    export class OrderedHashmap<T extends IHashable> implements IOrderedHashmap {

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
                return this.itemMap[item.hashCode()];
            }
        }

        /**
         * Checks if the item list has a item
         * @returns {boolean}
         * @param item
         */
        public has(item: any) {
            if(typeof item === 'string') {
                return this.itemMap.hasOwnProperty(item);
            } else if(item instanceof IHashable) {
                return this.itemMap.hasOwnProperty(item.hashCode())
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
            if(this.has(item)) {
                if(typeof item === 'string') {
                    return this.itemMap[item];
                } else if(item instanceof T) {
                    return this.itemMap[item.hashCode()];
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }

        /**
         * Removes a item from the list
         * @param item
         */
        public remove(item: any): boolean {
            if(this.has(item)) {
                if(typeof item === 'string') {
                    var itemObject = this.itemMap[item];
                    this.items.splice(this.items.indexOf(itemObject), 1);
                    delete this.itemMap[item];
                    return true;
                } else if(item instanceof T) {
                    var itemObject = this.itemMap[item.hashCode()];
                    this.items.splice(this.items.indexOf(itemObject), 1);
                    delete this.itemMap[item.hashCode()];
                    return true;
                }
            }
            return false;
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
class FilterEngine {
    constructor() {
        this.filters = [];
        this.activeFilters = [];
    }

    addFilter(filter) {
        this.filters.push(filter);
    }

    activateFilter(filterName) {
        const filter = this.filters.find(f => f.name === filterName);
        if (filter) {
            this.activeFilters.push(filter);
        }
    }

    deactivateFilter(filterName) {
        this.activeFilters = this.activeFilters.filter(f => f.name !== filterName);
    }

    filterMessage(message) {
        for (const filter of this.activeFilters) {
            if (filter.test(message)) {
                return false; // Message is filtered out
            }
        }
        return true; // Message passes through
    }

    clearFilters() {
        this.activeFilters = [];
    }
}

class SpamFilter {
    constructor() {
        this.name = 'SpamFilter';
        this.regex = /spam|junk|advertisement/i; // Example regex for spam
    }

    test(message) {
        return this.regex.test(message);
    }
}

// Example usage
const filterEngine = new FilterEngine();
filterEngine.addFilter(new SpamFilter());

// Export the FilterEngine class
export default FilterEngine;
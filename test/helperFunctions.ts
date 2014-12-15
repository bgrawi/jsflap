interface MachineConfiguration {
    config: string;
    accept: string[];
    reject: string[];
}

/**
 * Loads all configurations
 * @param name
 * @returns {any}
 */
function loadConfigurations(name: string): MachineConfiguration[] {
    return <MachineConfiguration[]> JSON.parse(__html__['test/configurations/' + name + '.json']);
}
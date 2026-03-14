import TestSequencer from '@jest/test-sequencer';

class CustomSequencer extends TestSequencer {
  async sort(tests) {
    // Run utils first, then middlewares, then models, then controllers, then routes
    const order = ['utils', 'middlewares', 'models', 'controllers', 'routes'];
    
    return tests.sort((a, b) => {
      const aOrder = order.findIndex((type) => a.path.includes(type));
      const bOrder = order.findIndex((type) => b.path.includes(type));
      
      if (aOrder === -1) return 1;
      if (bOrder === -1) return -1;
      
      return aOrder - bOrder;
    });
  }
}

export default CustomSequencer;

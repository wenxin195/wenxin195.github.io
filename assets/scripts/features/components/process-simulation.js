export function createProcessSimulationComponent(models) {
  return {
    validate(config) {
      const model = models.get(config.model);
      if (!model) throw new Error(`未注册的过程模拟模型：${config.model}`);
      model.validate(config);
    },

    mount(root, config) {
      return models.get(config.model).mount(root, config);
    },
  };
}

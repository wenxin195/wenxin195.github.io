export function createParameterExplorerComponent(models) {
  return {
    validate(config) {
      const model = models.get(config.model);
      if (!model) throw new Error(`未注册的参数探索模型：${config.model}`);
      model.validate(config);
    },

    mount(root, config) {
      return models.get(config.model).mount(root, config);
    },
  };
}

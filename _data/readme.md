该文件夹为 jekyll 专门用来存放结构化数据的文件夹。这个数据通常以 YAML、JSON 或 CSV 格式编写，并可以在整个站点中被访问和引用。这些文件可以存储一些全局的数据，方便在页面和模板中使用，减少代码冗余。

用`site.data.filename`的方式引用 yml 文件的内容，用`site.data.projects`的方式引用 json 文件的内容，用`site.data.items`的方式引用 csv 文件的内容，jekyll 会将每行 csv 数据解析成一个字典。

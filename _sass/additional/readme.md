该部分是模板的附加样式，包括文字和标签提示样式，以及图片显示样式。

用法：

1. 文字提示

    ```text
        Success Text.
        {:.success}

        Info Text.
        {:.info}
        
        Warning Text.
        {:.warning}

        Error Text.
        {:.error}   
    ```

2. 标签提示

    ```text
        `success`{:.success}

        `info`{:.info}

        `warning`{:.warning}

        `error`{:.error}
    ```

3. 图片样式

    ```text
        方形图片：![Image](path-to-image){:.border}
        边缘阴影：![Image](path-to-image){:.shadow}
        四周圆角：![Image](path-to-image){:.rounded}
        圆形图片：![Image](path-to-image){:.circle}
    ```

    四种参数都可以混搭，例如：`{:.border.rounded}`、`{:.circle.shadow}`、`{:.circle.border.shadow}`。

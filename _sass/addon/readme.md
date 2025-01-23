该部分是code block、table、prompt、colorbox和details的css样式。

用法：

1. code block：code block的用法满足markdown代码段的语法。

2. prompt

    ```text
        info prompt
        {: .prompt-info}

        tip prompt
        {: .prompt-tip}

        warning prompt
        {: .prompt-warning}

        danger prompt
        {: .prompt-danger}
    ```

3. colorbox

    ```text
        <div class="box-info" markdown="1">
        <div class="title"> info title </div>
            info context
        </div>

        <div class="box-tip" markdown="1">
        <div class="title"> tip title </div>
            tip context
        </div>

        <div class="box-warning" markdown="1">
        <div class="title"> warning title </div>
            warning context
        </div>

        <div class="box-danger" markdown="1">
        <div class="title"> danger title </div>
            danger context
        </div>
    ```

    如果省略掉`<div class="title"></div>`标签，则不会显示`title`。

4. details

    ```text
        <details class="details-definition" markdown="1">
        <summary> definition title </summary>
            definition context
        </details>

        <details class="details-example" markdown="1">
        <summary> example title </summary>
            example context
        </details>

        <details class="details-theorem" markdown="1">
        <summary> theorem title </summary>
            theorem context
        </details>

        <details class="details-proposition" markdown="1">
        <summary> proposition title </summary>
            proposition context
        </details>        
    ```

    同样如果省略掉`<summary></summary>`标签，则不会显示`title`。属性`markdown="1"`指示`context`是否展开，省略该属性则`context`默认关闭。

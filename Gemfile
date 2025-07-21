source "https://mirrors.tuna.tsinghua.edu.cn/rubygems"

# gem "jekyll", "~> 4.2"

# jekyll插件
group :jekyll_plugins do
  gem "github-pages"
  gem 'wdm', '>= 0.1.0' if Gem.win_platform?
end

# 时区管理
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

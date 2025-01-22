source "https://mirrors.tuna.tsinghua.edu.cn/rubygems"

gem 'jekyll'
group :jekyll_plugins do
    gem "github-pages"
    gem "jekyll-archives"
    gem "jekyll-minifier"
    gem "jekyll-admin"
    gem 'wdm', '>= 0.1.0' if Gem.win_platform?
  end

platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end
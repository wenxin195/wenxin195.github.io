source "https://mirrors.tuna.tsinghua.edu.cn/rubygems"

gem 'jekyll'
gem 'faraday-retry'
gem 'wdm' if Gem.win_platform?

# jekyll插件
group :jekyll_plugins do
  # gem 'github-pages'  
  gem 'jekyll-paginate'
  gem 'jekyll-seo-tag'
  gem 'jekyll-sitemap'
  gem 'jekyll-include-cache'
end

# 时区管理
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo"
  gem "tzinfo-data"
end

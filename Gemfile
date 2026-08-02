source "https://rubygems.org"
# Optional CN mirror: bundle config set --local mirror.https://rubygems.org https://mirrors.tuna.tsinghua.edu.cn/rubygems

gem 'jekyll'
gem 'faraday-retry'
gem 'nokogiri'
gem "wdm", "~> 0.2.0", platforms: %i[mingw mswin x64_mingw windows]

# jekyll插件
group :jekyll_plugins do
  # gem 'github-pages'  
  gem 'jekyll-paginate'
  gem 'jekyll-seo-tag'
  gem 'jekyll-sitemap'
  gem 'jekyll-feed'
end

# 时区管理
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo"
  gem "tzinfo-data"
end

import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

// 多源图片搜索API
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activityName = searchParams.get('activityName')
    const locationName = searchParams.get('locationName')
    
    if (!activityName) {
      return NextResponse.json(
        { error: 'Activity name is required' },
        { status: 400 }
      )
    }

    const images: Array<{ url: string; description: string }> = []
    
    // 1. 尝试Wikipedia图片搜索
    try {
      const wikiSearchTerm = `${activityName}${locationName ? ` ${locationName}` : ''}`
      const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiSearchTerm)}`
      
      const wikiResponse = await Promise.race([
        axios.get(wikiUrl, { timeout: 5000 }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Wikipedia timeout')), 5000)
        )
      ]) as any
      
      if (wikiResponse?.data?.thumbnail?.source) {
        images.push({
          url: wikiResponse.data.thumbnail.source,
          description: wikiResponse.data.extract || `${activityName}${locationName ? ` (${locationName})` : ''}`
        })
        // 如果找到原始图片（不是缩略图），也添加
        if (wikiResponse.data.original?.source) {
          images.push({
            url: wikiResponse.data.original.source,
            description: wikiResponse.data.extract || `${activityName}${locationName ? ` (${locationName})` : ''}`
          })
        }
      }
    } catch (error: any) {
      console.log('Wikipedia search timeout or failed, skipping (will use other sources)')
    }

    // 2. 尝试Unsplash API
    const unsplashKey = searchParams.get('unsplashKey')
    if (unsplashKey) {
      try {
        const unsplashQuery = `${activityName}${locationName ? ` ${locationName}` : ''} travel`
        const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(unsplashQuery)}&per_page=3&client_id=${unsplashKey}`
        
        const unsplashResponse = await axios.get(unsplashUrl, { timeout: 10000 })
        if (unsplashResponse.data?.results) {
          unsplashResponse.data.results.forEach((photo: any) => {
            images.push({
              url: photo.urls.regular,
              description: photo.description || photo.alt_description || `${activityName}${locationName ? ` (${locationName})` : ''}`
            })
          })
        }
      } catch (error: any) {
        console.log('Unsplash API failed:', error.message)
      }
    }

    // 3. 尝试Pexels API
    const pexelsKey = searchParams.get('pexelsKey')
    if (pexelsKey) {
      try {
        const pexelsQuery = `${activityName}${locationName ? ` ${locationName}` : ''}`
        const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(pexelsQuery)}&per_page=3`
        
        const pexelsResponse = await axios.get(pexelsUrl, {
          headers: { 'Authorization': pexelsKey },
          timeout: 10000
        })
        if (pexelsResponse.data?.photos) {
          pexelsResponse.data.photos.forEach((photo: any) => {
            images.push({
              url: photo.src.large,
              description: photo.photographer || `${activityName}${locationName ? ` (${locationName})` : ''}`
            })
          })
        }
      } catch (error: any) {
        console.log('Pexels API failed:', error.message)
      }
    }

    // 4. 尝试Google Custom Search API
    const googleApiKey = searchParams.get('googleApiKey')
    const googleSearchEngineId = searchParams.get('googleSearchEngineId')
    if (googleApiKey && googleSearchEngineId) {
      try {
        const googleQuery = `${activityName}${locationName ? ` ${locationName}` : ''}`
        const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleSearchEngineId}&q=${encodeURIComponent(googleQuery)}&searchType=image&num=3`
        
        const googleResponse = await axios.get(googleUrl, { timeout: 10000 })
        if (googleResponse.data?.items) {
          googleResponse.data.items.forEach((item: any) => {
            images.push({
              url: item.link,
              description: item.title || `${activityName}${locationName ? ` (${locationName})` : ''}`
            })
          })
        }
      } catch (error: any) {
        console.log('Google Custom Search API failed:', error.message)
      }
    }

    // 5. 尝试Bing Image Search API
    const bingApiKey = searchParams.get('bingApiKey')
    if (bingApiKey) {
      try {
        const bingQuery = `${activityName}${locationName ? ` ${locationName}` : ''}`
        const bingUrl = `https://api.bing.microsoft.com/v7.0/images/search?q=${encodeURIComponent(bingQuery)}&count=3`
        
        const bingResponse = await axios.get(bingUrl, {
          headers: { 'Ocp-Apim-Subscription-Key': bingApiKey },
          timeout: 10000
        })
        if (bingResponse.data?.value) {
          bingResponse.data.value.forEach((item: any) => {
            images.push({
              url: item.contentUrl,
              description: item.name || `${activityName}${locationName ? ` (${locationName})` : ''}`
            })
          })
        }
      } catch (error: any) {
        console.log('Bing Image Search API failed:', error.message)
      }
    }

    // 去重
    const uniqueImages = images.filter((img, index, self) =>
      index === self.findIndex((t) => t.url === img.url)
    )

    if (uniqueImages.length > 0) {
      return NextResponse.json({
        images: uniqueImages.slice(0, 5), // 最多返回5张图片
        message: `Found ${uniqueImages.length} images`
      })
    } else {
      return NextResponse.json({
        images: [],
        message: '未找到相关图片'
      })
    }
  } catch (error: any) {
    console.error('Image search error:', error)
    return NextResponse.json(
      { error: error.message || 'Image search failed', images: [] },
      { status: 500 }
    )
  }
}


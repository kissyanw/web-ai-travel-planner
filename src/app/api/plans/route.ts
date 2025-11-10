import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request)
    
    // 获取当前用户
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 获取用户的旅行计划
    const { data, error } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ plans: data })
  } catch (error: any) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request)
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from('travel_plans')
      .insert({
        ...body,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ plan: data })
  } catch (error: any) {
    console.error('Error creating plan:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request)
    
    // 获取当前用户（Supabase 会自动从请求头中的 Authorization 或 cookies 中获取认证信息）
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('id')

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    // 删除计划（由于外键约束，相关的expenses和activity_images会自动删除）
    const { error } = await supabase
      .from('travel_plans')
      .delete()
      .eq('id', planId)
      .eq('user_id', user.id) // 确保只能删除自己的计划

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting plan:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
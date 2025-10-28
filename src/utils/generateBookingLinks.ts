import { supabase } from '../lib/supabase'

interface Candidate {
  candidate_id: string
  first_name: string
  last_name: string
  email: string
  mobile_num?: string
}

interface BookingLink {
  candidate_id: string
  candidate_name: string
  booking_url: string
}

export const generateBookingLink = (candidateId: string, baseUrl?: string): string => {
  const base = baseUrl || window.location.origin
  return `${base}/book?candidate_id=${candidateId}`
}

export const generateBookingLinksForCandidates = async (
  candidateIds?: string[],
  baseUrl?: string
): Promise<BookingLink[]> => {
  try {
    let query = supabase
      .from('hrta_cd00-01_resume_extraction')
      .select('candidate_id, first_name, last_name, email, mobile_num')

    if (candidateIds && candidateIds.length > 0) {
      query = query.in('candidate_id', candidateIds)
    }

    const { data, error } = await query

    if (error) throw error

    const base = baseUrl || window.location.origin

    return (data || []).map((candidate: Candidate) => ({
      candidate_id: candidate.candidate_id,
      candidate_name: `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || 'Unknown',
      booking_url: `${base}/book?candidate_id=${candidate.candidate_id}`,
    }))
  } catch (error) {
    console.error('Error generating booking links:', error)
    throw error
  }
}

export const generateBookingLinksForInterviewCandidates = async (
  baseUrl?: string
): Promise<BookingLink[]> => {
  try {
    const { data, error } = await supabase
      .from('hrta_cd00-01_resume_extraction')
      .select('candidate_id, first_name, last_name, email, mobile_num')
      .eq('status', 'For Interview')

    if (error) throw error

    const base = baseUrl || window.location.origin

    return (data || []).map((candidate: Candidate) => ({
      candidate_id: candidate.candidate_id,
      candidate_name: `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || 'Unknown',
      booking_url: `${base}/book?candidate_id=${candidate.candidate_id}`,
    }))
  } catch (error) {
    console.error('Error generating booking links:', error)
    throw error
  }
}

export const saveBookingLinksToDatabase = async (
  bookingLinks: BookingLink[]
): Promise<void> => {
  try {
    const records = bookingLinks.map((link) => ({
      candidate_id: link.candidate_id,
      prefill_url: link.booking_url,
    }))

    const { error } = await supabase
      .from('hrta_sd00-05_store_prefillUrls')
      .upsert(records, {
        onConflict: 'candidate_id',
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving booking links to database:', error)
    throw error
  }
}

export const getBookingLinkFromDatabase = async (
  candidateId: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('hrta_sd00-05_store_prefillUrls')
      .select('prefill_url')
      .eq('candidate_id', candidateId)
      .maybeSingle()

    if (error) throw error

    return data?.prefill_url || null
  } catch (error) {
    console.error('Error fetching booking link from database:', error)
    return null
  }
}

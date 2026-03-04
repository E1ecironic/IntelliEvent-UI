export interface ActivityTask {
  id?: string | number
  name?: string
  responsible?: string
  deadline?: string
  status?: string
}

export interface Activity {
  id?: string
  name?: string
  type?: string
  date?: string
  timeRange?: string
  location?: string
  participants?: number
  budget?: number
  status?: string
  responsible?: string
  description?: string
  createdAt?: string
  updatedAt?: string
  tasks?: ActivityTask[]
  dateStart?: string
  dateEnd?: string
}

'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function OrderEdit() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)
  const apiURL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${apiURL}/api/v1/orders/${id}`, {withCredentials: true})
      setOrder(response.data.data.order)
    } catch (err) {
      setError('Failed to load order details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      
      // Create a new object with only editable fields
      const editableOrder = {
        title: order.title,
        description: order.description,
        notes: order.notes,
        price: order.price,
        estimated_time: order.estimated_time,
        payment_method: order.payment_method,
        delivery_status: order.delivery_status,
        delivery_date: order.delivery_date,
        employee_id: order.employee_id,
        company_id: order.company_id,
        priority: order.priority,
        url: order.url,
        final_status: order.final_status
      }

      const response = await axios.put(`${apiURL}/api/v1/orders/${id}`, editableOrder, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      })
      console.log(response.data)

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Order updated successfully",
        })
        navigate('/order-history')
      } else {
        throw new Error('Unexpected response status: ' + response.status)
      }
    } catch (err) {
      setError('Failed to update order')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setOrder(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!order) {
    return <div>Order not found</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Order Title</Label>
          <Input
            id="title"
            value={order.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={order.description}
            onChange={(e) => handleChange('description', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={order.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={order.price}
            onChange={(e) => handleChange('price', Number(e.target.value))}
            required
          />
        </div>

        <div>
          <Label>Estimated Time</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !order.estimated_time && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {order.estimated_time ? format(new Date(order.estimated_time), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={order.estimated_time ? new Date(order.estimated_time) : null}
                onSelect={(date) => handleChange('estimated_time', date?.toISOString())}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="payment_method">Payment Method</Label>
          <Select 
            value={order.payment_method}
            onValueChange={(value) => handleChange('payment_method', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank">Bank</SelectItem>
              <SelectItem value="card">Card</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="delivery_status">Delivery Status</Label>
          <Select
            value={order.delivery_status}
            onValueChange={(value) => handleChange('delivery_status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="delivery_date">Delivery Date</Label>
          <Input
            id="delivery_date"
            type="date"
            value={order.delivery_date || ''}
            onChange={(e) => handleChange('delivery_date', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="employee_id">Employee ID</Label>
          <Input
            id="employee_id"
            type="number"
            value={order.employee_id}
            onChange={(e) => handleChange('employee_id', Number(e.target.value))}
          />
        </div>

        <div>
          <Label htmlFor="company_id">Company ID</Label>
          <Input
            id="company_id"
            type="number"
            value={order.company_id}
            onChange={(e) => handleChange('company_id', Number(e.target.value))}
          />
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <Input
            id="priority"
            type="number"
            value={order.priority}
            onChange={(e) => handleChange('priority', Number(e.target.value))}
          />
        </div>

        <div>
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            value={order.url}
            onChange={(e) => handleChange('url', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="final_status">Final Status</Label>
          <Select
            value={order.final_status}
            onValueChange={(value) => handleChange('final_status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Display non-editable fields */}
        <div>
          <Label>Order ID</Label>
          <p>{order.id}</p>
        </div>

        <div>
          <Label>Attachment</Label>
          {order.attachment ? (
            <a 
              href={order.attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View Attachment
            </a>
          ) : (
            <p>No attachment</p>
          )}
        </div>

        <div>
          <Label>Approval Chain</Label>
          <ul className="list-disc pl-5">
            {order.approval_chain.map((approval, index) => (
              <li key={index}>
                Role ID: {approval.role_id}, Status: {approval.status}, 
                Timestamp: {new Date(approval.timestamp).toLocaleString()}, 
                Comment: {approval.comment}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Label>Signatures</Label>
          <ul className="list-disc pl-5">
            {order.signatures.map((signature, index) => (
              <li key={index}>
                Signer: {signature.signer_type} (ID: {signature.signer_id}), 
                Signed at: {new Date(signature.signed_at).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Button type="submit" disabled={saving}>
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  )
}


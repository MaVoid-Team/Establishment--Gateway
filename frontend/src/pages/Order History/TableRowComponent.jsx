import { useTranslation } from 'react-i18next';
import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import PropTypes from 'prop-types'
import { useNavigate,} from 'react-router-dom'
import { Edit, Trash2 } from 'lucide-react'

const TableRowComponent = ({ order, employeeDisplay, isAdmin, onDelete, onEdit }) => {
  const { t } = useTranslation();
  const navigate = useNavigate()
  const handleViewDetails = () => {
    navigate(`/orders/${order.id}`, { state: { order } })
  }
  onEdit = () => {
    navigate(`/edit-order-details/${order.id}`, { state: { order } })
  }

  const getStatusColor = (final_status) => {
    switch (final_status) {
      case "pending":
        return "rounded-sm bg-yellow-500"
      case "approved":
        return "rounded-sm bg-green-500"
      case "rejected":
        return "rounded-lg bg-red-500"
      case "Work In Progress":
        return "rounded-sm bg-blue-500"
      default:
        return "rounded-sm bg-gray-500"
    }
  }

  return (
    <TableRow key={order.id}>
      <TableCell className="text-center backdrop-blur-sm backdrop-opacity-75">{order.id}</TableCell>
      {isAdmin &&<TableCell className="text-center backdrop-blur-sm backdrop-opacity-75">{employeeDisplay}</TableCell>}
      <TableCell className="text-center backdrop-blur-sm backdrop-opacity-75">{order.title}</TableCell>
      <TableCell className="text-center backdrop-blur-sm backdrop-opacity-75">
        <Badge className={`${getStatusColor(order.final_status)} text-white capitalize `}>
          {t(order.final_status)}
        </Badge>
      </TableCell>
      <TableCell className="text-center backdrop-blur-sm backdrop-opacity-75">{new Date(order.created_at).toLocaleString()}</TableCell>
      <TableCell className="text-center backdrop-blur-sm backdrop-opacity-75">
        {order.price} {t('SAR')}
        
      </TableCell>
      <TableCell className="text-center capitalize backdrop-blur-sm backdrop-opacity-75">{t(order.payment_method)}</TableCell>
      <TableCell className="text-center backdrop-blur-sm backdrop-opacity-75">
        <div className="flex justify-center space-x-2">
          <Button onClick={handleViewDetails}>{t('viewDetails')}</Button>
          {isAdmin && (
            <>
              <Button variant="outline" onClick={() => onEdit(order)}>
                <Edit className="h-4 w-4 mr-2" />
                {t('edit')}
              </Button>
              <Button variant="outline" onClick={() => onDelete(order.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                {t('delete')}
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

TableRowComponent.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    final_status: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    payment_method: PropTypes.string.isRequired,
  }).isRequired,
  employeeDisplay: PropTypes.node.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
}

export default TableRowComponent

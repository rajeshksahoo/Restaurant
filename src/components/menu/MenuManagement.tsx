import React, { useState, useContext } from 'react';
import { Plus, Edit, Trash2, Upload, Eye, EyeOff, Clock } from 'lucide-react';
import { RestaurantContext } from '../../context/RestaurantContext';
import { Card, CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { MenuItem } from '../../types';

const MenuManagement: React.FC = () => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useContext(RestaurantContext);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'mains',
    type: 'veg',
    prep_time: '15',
    image: ''
  });

  const categories = ['Sandvich', 'Salads', 'Burgers','Bakes & Meals','Choice of Pasta','Pizza','Extra Toppings','Hearth Stone Special','Soups','Starters','Main Course','Noodles','Rice','Chats','Subziyan','Dals','Breads','Rice / Pulao / Biryanis / Raitas','Dessert','Meal For One (North Indian)','South-Indian','Dosas','Uttapam','Sweets','Extra','Fresh Juices','Smoothies & Mocktails','Ice Cream','Sundaes','Tea & Coffee','Beverages'];
  const types = ['veg', 'non-veg'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemData = {
      ...formData,
      price: parseFloat(formData.price),
      prep_time: parseInt(formData.prep_time),
      available: true
    };

    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, itemData);
        setEditingItem(null);
      } else {
        await addMenuItem(itemData);
        setIsAddingItem(false);
      }
      
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'mains',
        type: 'veg',
        prep_time: '15',
        image: ''
      });
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      type: item.type || 'veg',
      prep_time: item.prep_time.toString(),
      image: item.image || ''
    });
    setIsAddingItem(true);
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await updateMenuItem(item.id, { available: !item.available });
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
        <Button onClick={() => setIsAddingItem(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {/* Add/Edit Form */}
      {isAddingItem && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {types.map(type => (
                      <option key={type} value={type}>
                        {type === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prep Time (minutes) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.prep_time}
                    onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter item description"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" variant="primary">
                  {editingItem ? 'Update Item' : 'Add Item'}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => {
                    setIsAddingItem(false);
                    setEditingItem(null);
                    setFormData({
                      name: '',
                      description: '',
                      price: '',
                      category: 'mains',
                      type: 'veg',
                      prep_time: '15',
                      image: ''
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Card key={item.id} hover>
            <div className="relative">
              <img
                src={item.image || "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"}
                alt={item.name}
                className="w-full h-48 object-cover rounded-t-xl"
              />
              <div className="absolute top-2 left-2 flex gap-2">
                <Badge variant={item.type === 'veg' ? 'success' : 'error'} size="sm">
                  {item.type === 'veg' ? '🌱 Veg' : '🍖 Non-Veg'}
                </Badge>
                <Badge variant="info" size="sm">
                  {item.category}
                </Badge>
              </div>
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => handleToggleAvailability(item)}
                  className={`p-1 rounded-full ${item.available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                >
                  {item.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <span className="text-lg font-bold text-blue-600">₹{item.price.toFixed(2)}</span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{item.prep_time} min</span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => deleteMenuItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MenuManagement;
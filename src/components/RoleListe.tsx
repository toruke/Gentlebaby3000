import {Text, FlatList, TouchableOpacity } from 'react-native';
import { stylesFamily } from '../styles/FamilyManagementStyle';
interface RoleListProps {
  list: { id: string; role: string }[];
  onSelect: (role: string) => void;
  getUpperName: (role: string) => string;
  
}
export const RoleList = ({list, onSelect, getUpperName} : RoleListProps) => {
  
  return (
    <FlatList
      data={list}
      renderItem={({item}) => 
        <TouchableOpacity style={stylesFamily.roleItem} onPress={() => onSelect(item.role)}>
          <Text style={stylesFamily.roleText}>
            {getUpperName(item.role)}
          </Text>
        </TouchableOpacity>}
      keyExtractor={item => item.id}
    />
  );

};
import {useEffect, useState} from 'react';
import './App.css';
import axios from 'axios';
import { RiDeleteBin5Line } from "react-icons/ri";
import { TiTick } from "react-icons/ti";
import { FcCancel } from "react-icons/fc";
import { RiEdit2Fill } from "react-icons/ri";
import { ListItemType } from './types/list-item.type';


// type dataType = {
//   id: number;
//   title: string;
// };

function App() {
  const [listItems, setListItems] = useState<[]>();
  const [formInput, setFormInput] = useState<string>("");
  const [allowEdit, setAllowEdit] = useState<boolean>(true);

  useEffect(()=>{
    axios({
      method: 'get',
      url: 'http://localhost:3000',
      responseType: 'json'
    }).then(async (response)=>{
      const data = await response.data;
      data.sort(function(a: ListItemType, b: ListItemType){
        return a.id - b.id
      })
      let listDom = data.map((item: ListItemType)=>{
        return(
          <div key={item.id}>

            <div className='item' id={`edit-item-${item.id}`}>
              <span className={`item-text`} onClick={strikeOut}>
                {item.title}
              </span>

              <button className='delete-button' id={(item.id).toString()} onClick={deleteItem}>
                < RiDeleteBin5Line/>
              </button>

              <button className='edit-button' id={(item.id).toString()} onClick={editItem}>
                < RiEdit2Fill />
              </button>
            </div>

            <div id={`edit-form-${item.id}`} className='edit-form' hidden>
              <form id={(item.id).toString()} onSubmit={handleEdit}>

                <input type="text" id={`edit-input${item.id}`} className='edit-text-input' placeholder='Enter New Task' required/>

                <span onClick={cancelEdit} id={(item.id).toString()} className='cancel-edit-button' >
                  <FcCancel />
                </span>

                <button type='submit' className='save-edit-button'>
                  <TiTick />
                </button>

              </form>
            </div>

          </div>
        )
      });
        setListItems(listDom)
    })
  })

  function strikeOut(event:any) {
    const clickedItem = event.target;
    const clickedItemStyle = clickedItem.style.textDecoration
    if (clickedItemStyle) {
      clickedItem.style.textDecoration = 'none';
    }else{
      clickedItem.style.textDecoration = 'line-through';
    }
  };


  function deleteItem(event: any){
    const clickedArea = event.target.localName;
    function deleteItemRequest(id: string){
      axios({
        method: 'post',
        url: 'http://localhost:3000/delete',
        data: {
          deleteItemId: id
        }
      }).catch(error=>{
        console.log(error)
      })
    }

    if (clickedArea === 'button') {
      const deleteItemId: string = (event.target).id;
      deleteItemRequest(deleteItemId);
    }
    if (clickedArea === 'svg') {
      const deleteItemId: string = ((event.target).parentElement).id;
      deleteItemRequest(deleteItemId);
    }
    if (clickedArea === 'path') {
      const deleteItemId: string = (((event.target).viewportElement).parentElement).id;
      deleteItemRequest(deleteItemId);
    };
  };

  function editItem(event: any){
    if (allowEdit) {
      setAllowEdit(false)
      const clickedArea = event.target.localName;
      function editMode(id: string){
        const editItem = document.getElementById(`edit-item-${id}`);
        const editForm = document.getElementById(`edit-form-${id}`);
        editItem?.setAttribute("hidden", "true");
        editForm?.removeAttribute("hidden");
      };
      if (clickedArea === 'button') {
        const editItemId: string = (event.target).id;
        editMode(editItemId);
      };
      if (clickedArea === 'svg') {
        const editItemId: string = ((event.target).parentElement).id;
        editMode(editItemId);
      };
      if (clickedArea === 'path') {
        const editItemId: string = (((event.target).viewportElement).parentElement).id;
        editMode(editItemId);
      };
    } else {
      alert('finish all existing edits first');
    };
  };

  async function handleEdit(event: any){
    event.preventDefault();
    const formInput = event.target[0].value;
    const formId = event.target.id
    // console.log(formInput, event.target[1].value)
    await axios({
      method: 'post',
      url: 'http://localhost:3000/edit',
      data: {
        updatedItemId: formId,
        updatedItemTitle: formInput
      }
    }).then(()=>{
      setAllowEdit(true);
      const editItem = document.getElementById(`edit-item-${formId}`);
      const editForm = document.getElementById(`edit-form-${formId}`);
      editItem?.removeAttribute("hidden");
      editForm?.setAttribute("hidden", "true");
    });
  };

  function cancelEdit(e: any){
    
    const clickedArea = e.target.localName;

    let editItemId: string | undefined;

    if (clickedArea === 'button') {
       editItemId = (e.target).id;
    };
    if (clickedArea === 'svg') {
       editItemId = ((e.target).parentElement).id;
    };
    if (clickedArea === 'path') {
       editItemId = (((e.target).viewportElement).parentElement).id;
    };

    setAllowEdit(true);
    const editItem = document.getElementById(`edit-item-${editItemId}`);
    const editForm = document.getElementById(`edit-form-${editItemId}`);
    const editItemInput = document.getElementById(`edit-input-${editItemId}`);

    editItem?.removeAttribute("hidden");
    editForm?.setAttribute("hidden", "true");
  }

  function handleSubmit(event: any){
    event.preventDefault();
    const formInput = event.target[0].value;
    axios({
      method: 'post',
      url: 'http://localhost:3000/add',
      data: {
        newItem: formInput
      },
    }).then(()=>{
      setFormInput("")
    });
  }; 

  function dayAsString(){
    const dayNumber = (new Date()).getDay()
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return weekdays[dayNumber-1]
  }

  return (
    <div id='app'>

      <div>
        <img src="https://drive.usercontent.google.com/download?id=1GPJaxdsRIVNiGPNY3gmKeFJ4EFgegjZn" alt="" />
      </div>
      <div id='date'>
        <h1>{dayAsString()}</h1>
      </div>

      <div id='list-box'>
        {listItems?.length
        ? listItems
        : <h3>Add new item 😁</h3> }
      </div>

      <div id='new-item-form'>
          <form id='form' onSubmit={handleSubmit}>

              <input id='list-input' type='text' placeholder='Add New Item' value={formInput} onChange={e=>{setFormInput(e.target.value)}} autoComplete='off' required></input>

              <button id='newItem-button'>Add</button>
          </form>
      </div>
    </div>

  );
}


export default App;
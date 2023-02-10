import { DropdownQuestion } from "src/app/Models/Forms/dropdown"


export const user_questionaire = () => {
    new DropdownQuestion({
        key: 'user_role',
        label: 'Rol de Usuario',
        value: true,
        required: true,
        order: 0,
        options: [
          {
            key: 'driver',
            value: 'Conductor',
          },
          {
            key: 'analyst',
            value: 'Analista',
          },
          {
            key: 'rest_admin',
            value: 'Calendarizar',
          },
        ],
        verfication: false,
      })
}
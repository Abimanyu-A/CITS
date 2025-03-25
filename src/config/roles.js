const RESOURCES = {
    EMPLOYEE: 'employee',
    DEPARTMENT: 'department',
};

const ACTIONS = {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    MANAGE: 'manage', 
    APPROVE: 'approve'
};

// Roles
const ROLES = {
    CEO: 'ceo',
    VP: 'vp',
    MANAGER: 'manager',
    TEAM_LEAD: 'team_lead',
    EMPLOYEE: 'employee'
};

const ROLE_HIERARCHY = {
    [ROLES.CEO]: [ROLES.VP],
    [ROLES.VP]: [ROLES.MANAGER],
    [ROLES.MANAGER]: [ROLES.TEAM_LEAD],
    [ROLES.TEAM_LEAD]: [ROLES.EMPLOYEE],
    [ROLES.EMPLOYEE]: []
};

const PERMISSIONS = {
    [ROLES.CEO]: [
        //CEO has access to everything
        {resource: '*', actions: [ACTIONS.MANAGE]}
    ],
    [ROLES.VP]:[

    ],
    [ROLES.MANAGER]:[

    ],
    [ROLES.TEAM_LEAD]:[

    ],
    [ROLES.EMPLOYEE]:[
        { resource: RESOURCES.EMPLOYEE, actions: [ACTIONS.READ] },
        { resource: RESOURCES.DEPARTMENT, actions: [ACTIONS.READ] }
    ]
}

function getPermissions(role){
    let effective = [...(PERMISSIONS[role] || [])];
    const inheritedRoles = ROLE_HIERARCHY[role] || [];
    for(const inheritedRole of inheritedRoles){
        effective  = [...effective, ...getPermissions(inheritedRole)];
    }

    return effective;
}

export { ROLES, RESOURCES, ACTIONS, PERMISSIONS, getPermissions };


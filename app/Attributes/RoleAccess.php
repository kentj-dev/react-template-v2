<?php

namespace App\Attributes;

use Attribute;

#[Attribute(Attribute::TARGET_METHOD | Attribute::IS_REPEATABLE)]
class RoleAccess
{
    public string $path;
    public string $permission;

    public function __construct(string $path, string $permission = 'can_view')
    {
        $this->path = $path;
        $this->permission = $permission;
    }
}

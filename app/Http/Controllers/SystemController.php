<?php

namespace App\Http\Controllers;

use App\Models\System;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemController extends Controller
{
    public function index()
    {
        $systems = System::orderBy('created_at', 'desc')->get();

        return Inertia::render('systems/index', [
            'systems' => $systems
        ]);
    }
}

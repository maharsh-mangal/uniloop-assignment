<?php

namespace App\Policies;

use App\Models\CustomBlock;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CustomBlockPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, CustomBlock $customBlock): bool
    {
        return $user->id === $customBlock->user_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, CustomBlock $customBlock): bool
    {
        return $user->id === $customBlock->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, CustomBlock $customBlock): bool
    {
        return $user->id === $customBlock->user_id;
    }
}
